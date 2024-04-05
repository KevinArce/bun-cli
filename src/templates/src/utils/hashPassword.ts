export async function hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password, {
        algorithm: "argon2id",
        memoryCost: 4,
        timeCost: 2,
    });
}
