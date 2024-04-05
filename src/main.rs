use std::io;
use std::process::Command;

fn main() {
    println!("A Cool name for your Bun project 😎:");

    let mut project_name = String::new();
    io::stdin()
        .read_line(&mut project_name)
        .expect("Generic error message that doesn't help you at all 🤣");

    let project_name = project_name.trim();

    // Generate project
    let output = Command::new("bun")
        .arg("create")
        .arg("elysia")
        .arg(&project_name)
        .output()
        .expect(
            "Failed to execute bun create command 😭. Make sure you have bun installed globally 👀"
        );

    if output.status.success() {
        println!("Project '{}' created successfully 🥳", project_name);
        // Add dependencies
        let deps = [
            "@bogeychan/elysia-logger",
            "@elysiajs/cors",
            "@elysiajs/swagger",
            "@sentry/bun",
            "@sentry/cli",
            "@types/luxon",
            "jsonwebtoken",
            "luxon",
            "mongoose",
            "winston",
            "winston-daily-rotate-file",
        ];

        for dep in deps.iter() {
            let _ = Command::new("bun")
                .arg("add")
                .arg(dep)
                .current_dir(project_name)
                .output()
                .expect("Failed to add dependency");
            println!("Added dependency: {}", dep);
        }
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        println!("Failed to create project, should I be a designer instead? 🤔🥺: {}", error_message);
    }
}
