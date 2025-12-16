use crate::error::{BunCliError, Result};
use std::path::{Path, PathBuf};
use std::process::Command;

/// Configuration for project generation
pub struct ProjectConfig {
    pub name: String,
    pub dependencies: Vec<String>,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            name: String::new(),
            dependencies: vec![
                "@bogeychan/elysia-logger".to_string(),
                "@elysiajs/cors".to_string(),
                "@elysiajs/swagger".to_string(),
                "@sentry/bun".to_string(),
                "@sentry/cli".to_string(),
                "@types/luxon".to_string(),
                "jsonwebtoken".to_string(),
                "luxon".to_string(),
                "mongoose".to_string(),
                "winston".to_string(),
                "winston-daily-rotate-file".to_string(),
            ],
        }
    }
}

/// Generator for creating Bun projects
pub struct ProjectGenerator {
    config: ProjectConfig,
}

impl ProjectGenerator {
    /// Create a new project generator with the given configuration
    pub fn new(config: ProjectConfig) -> Self {
        Self { config }
    }

    /// Validate the project name
    fn validate_project_name(&self) -> Result<()> {
        let name = self.config.name.trim();
        
        if name.is_empty() {
            return Err(BunCliError::InvalidProjectName(
                "Project name cannot be empty".to_string(),
            ));
        }

        // Check for invalid characters (basic validation)
        if name.contains(['/', '\\', '\0']) {
            return Err(BunCliError::InvalidProjectName(
                format!("Project name '{}' contains invalid characters", name),
            ));
        }

        Ok(())
    }

    /// Check if Bun is installed on the system
    fn check_bun_installed(&self) -> Result<()> {
        let output = Command::new("bun")
            .arg("--version")
            .output()
            .map_err(|_| BunCliError::BunNotInstalled)?;

        if !output.status.success() {
            return Err(BunCliError::BunNotInstalled);
        }

        Ok(())
    }

    /// Create the base project using bun create
    fn create_base_project(&self) -> Result<()> {
        let output = Command::new("bun")
            .arg("create")
            .arg("elysia")
            .arg(&self.config.name)
            .output()?;

        if !output.status.success() {
            let error_message = String::from_utf8_lossy(&output.stderr);
            return Err(BunCliError::CommandFailed {
                command: format!("bun create elysia {}", self.config.name),
                message: error_message.to_string(),
            });
        }

        Ok(())
    }

    /// Install a single dependency
    fn install_dependency(&self, dep: &str) -> Result<()> {
        let output = Command::new("bun")
            .arg("add")
            .arg(dep)
            .current_dir(&self.config.name)
            .output()?;

        if !output.status.success() {
            let error_message = String::from_utf8_lossy(&output.stderr);
            return Err(BunCliError::DependencyFailed {
                dependency: dep.to_string(),
                message: error_message.to_string(),
            });
        }

        Ok(())
    }

    /// Install all dependencies
    fn install_dependencies(&self) -> Result<()> {
        for dep in &self.config.dependencies {
            // Attempt to install, but continue if one fails
            match self.install_dependency(dep) {
                Ok(_) => println!("✓ Added dependency: {}", dep),
                Err(e) => eprintln!("⚠ Warning: {}", e),
            }
        }
        Ok(())
    }

    /// Copy template files to the project
    fn copy_templates(&self) -> Result<()> {
        // Get the source template directory
        // In a binary distribution, templates would be embedded or in a known location
        let template_src = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("src")
            .join("templates")
            .join("src");

        if !template_src.exists() {
            // Templates don't exist, skip copying
            return Ok(());
        }

        let dest = PathBuf::from(&self.config.name).join("src");

        // Use a cross-platform approach to copy files
        Self::copy_dir_recursive(&template_src, &dest)?;

        Ok(())
    }

    /// Recursively copy directory contents (cross-platform)
    fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<()> {
        // Create destination directory if it doesn't exist
        if !dst.exists() {
            std::fs::create_dir_all(dst)?;
        }

        for entry in std::fs::read_dir(src)? {
            let entry = entry?;
            let file_type = entry.file_type()?;
            let src_path = entry.path();
            let dst_path = dst.join(entry.file_name());

            if file_type.is_dir() {
                Self::copy_dir_recursive(&src_path, &dst_path)?;
            } else {
                // Only copy if destination doesn't exist or is different
                let should_copy = if !dst_path.exists() {
                    true
                } else {
                    // Both src and dst exist, compare metadata
                    match (std::fs::metadata(&src_path), std::fs::metadata(&dst_path)) {
                        (Ok(src_metadata), Ok(dst_metadata)) => {
                            src_metadata.len() != dst_metadata.len()
                                || src_metadata.modified()? > dst_metadata.modified()?
                        }
                        _ => true, // If we can't read metadata, copy to be safe
                    }
                };

                if should_copy {
                    std::fs::copy(&src_path, &dst_path)?;
                }
            }
        }

        Ok(())
    }

    /// Generate the complete project
    pub fn generate(&self) -> Result<()> {
        // Validate project name
        self.validate_project_name()?;

        // Check if Bun is installed
        self.check_bun_installed()?;

        // Create base project
        println!("Creating project '{}'...", self.config.name);
        self.create_base_project()?;
        println!("✓ Project '{}' created successfully", self.config.name);

        // Install dependencies
        println!("Installing dependencies...");
        self.install_dependencies()?;

        // Copy templates
        println!("Copying template files...");
        match self.copy_templates() {
            Ok(_) => println!("✓ Template files copied successfully"),
            Err(e) => eprintln!("⚠ Warning: {}", e),
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_empty_project_name() {
        let config = ProjectConfig {
            name: "".to_string(),
            dependencies: vec![],
        };
        let generator = ProjectGenerator::new(config);
        
        let result = generator.validate_project_name();
        assert!(result.is_err());
        assert!(
            matches!(result, Err(BunCliError::InvalidProjectName(_))),
            "Expected InvalidProjectName error, got: {:?}",
            result
        );
    }

    #[test]
    fn test_validate_project_name_with_slash() {
        let config = ProjectConfig {
            name: "my/project".to_string(),
            dependencies: vec![],
        };
        let generator = ProjectGenerator::new(config);
        
        let result = generator.validate_project_name();
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_project_name_with_backslash() {
        let config = ProjectConfig {
            name: "my\\project".to_string(),
            dependencies: vec![],
        };
        let generator = ProjectGenerator::new(config);
        
        let result = generator.validate_project_name();
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_valid_project_name() {
        let config = ProjectConfig {
            name: "my-cool-project".to_string(),
            dependencies: vec![],
        };
        let generator = ProjectGenerator::new(config);
        
        let result = generator.validate_project_name();
        assert!(result.is_ok());
    }

    #[test]
    fn test_default_config_has_dependencies() {
        let config = ProjectConfig::default();
        assert!(!config.dependencies.is_empty());
        assert!(config.dependencies.contains(&"@elysiajs/cors".to_string()));
    }
}

