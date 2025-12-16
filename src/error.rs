use std::fmt;
use std::io;

/// Custom error types for the bun-cli application
#[derive(Debug)]
pub enum BunCliError {
    /// IO error occurred
    Io(io::Error),
    /// Command execution failed
    CommandFailed { command: String, message: String },
    /// Invalid project name
    InvalidProjectName(String),
    /// Bun is not installed
    BunNotInstalled,
    /// Template copy failed
    TemplateCopyFailed(String),
    /// Dependency installation failed
    DependencyFailed { dependency: String, message: String },
}

impl fmt::Display for BunCliError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BunCliError::Io(err) => write!(f, "IO error: {}", err),
            BunCliError::CommandFailed { command, message } => {
                write!(f, "Command '{}' failed: {}", command, message)
            }
            BunCliError::InvalidProjectName(name) => {
                write!(f, "Invalid project name '{}': must not be empty and should contain only valid characters", name)
            }
            BunCliError::BunNotInstalled => {
                write!(f, "Bun is not installed. Please install Bun globally from https://bun.sh")
            }
            BunCliError::TemplateCopyFailed(message) => {
                write!(f, "Failed to copy templates: {}", message)
            }
            BunCliError::DependencyFailed { dependency, message } => {
                write!(f, "Failed to install dependency '{}': {}", dependency, message)
            }
        }
    }
}

impl std::error::Error for BunCliError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            BunCliError::Io(err) => Some(err),
            _ => None,
        }
    }
}

impl From<io::Error> for BunCliError {
    fn from(err: io::Error) -> Self {
        BunCliError::Io(err)
    }
}

pub type Result<T> = std::result::Result<T, BunCliError>;
