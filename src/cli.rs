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
        generator.generate()?;

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
