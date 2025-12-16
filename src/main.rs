use bun_cli::Cli;
use std::process;

fn main() {
    if let Err(e) = Cli::run() {
        Cli::display_error(&e);
        process::exit(1);
    }
}
