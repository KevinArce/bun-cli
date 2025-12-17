use crate::error::Result;
use crate::generator::{ProjectConfig, ProjectGenerator};
use std::io;

/// CLI interface for the bun-cli tool
pub struct Cli;

impl Cli {
    /// Run the CLI application
    pub fn run() -> Result<()> {
        println!("🦀 Bun CLI Generator");
        println!("A Cool name for your Bun project 😎:");

        let project_name = Self::read_project_name()?;

        let config = ProjectConfig {
            name: project_name.clone(),
            ..Default::default()
        };

        let generator = ProjectGenerator::new(config);
        
        // Try to generate directly
        if let Err(e) = generator.generate() {
            // check specifically for BunNotInstalled error
            if let crate::error::BunCliError::BunNotInstalled = e {
                println!("\n❌ Bun is not installed.");
                println!("Would you like to install it now? (Y/n)");
                
                let mut response = String::new();
                io::stdin().read_line(&mut response)?;
                let response = response.trim().to_lowercase();
                
                if response == "y" || response == "yes" || response == "" {
                     ProjectGenerator::install_bun()?;
                     
                     // Update PATH for the current process to include the new bun binary
                     // This is needed so the next command can find 'bun'
                     let home = std::env::var("HOME").unwrap_or_default();
                     let bun_bin = format!("{home}/.bun/bin");
                     let current_path = std::env::var("PATH").unwrap_or_default();
                     std::env::set_var("PATH", format!("{bun_bin}:{current_path}"));
                     
                     // Verify installation
                     if ProjectGenerator::check_bun_installed().is_ok() {
                         println!("Retrying project creation...");
                         generator.generate()?;
                     } else {
                         return Err(crate::error::BunCliError::BunNotInstalled);
                     }
                } else {
                    return Err(e);
                }
            } else {
                return Err(e);
            }
        }

        println!("\n🥳 All done! Your project is ready to use.");
        println!("Run 'cd {project_name}' to get started!");

        Ok(())
    }

    /// Read project name from stdin
    fn read_project_name() -> Result<String> {
        let mut project_name = String::new();
        io::stdin().read_line(&mut project_name)?;
        Ok(project_name.trim().to_string())
    }

    /// Display an error message
    pub fn display_error(error: &dyn std::error::Error) {
        eprintln!("\n❌ Error: {error}");
        
        // Display the chain of errors if available
        let mut source = error.source();
        while let Some(err) = source {
            eprintln!("  Caused by: {err}");
            source = err.source();
        }
    }
}
