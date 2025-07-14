import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./api/errors";

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function checkPasswordHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
    userID: string,
    expiresIn: number,
    secret: string
): string {
    const issuedAt = Math.floor(Date.now() / 1000);

    return jwt.sign(
        {
            iss: TOKEN_ISSUER,
            sub: userID,
            iat: issuedAt,
            exp: issuedAt + expiresIn,
        } satisfies payload,
        secret
    );
}

export function validateJWT(tokenString: string, secret: string): string {
    let decoded: payload;

    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (error) {
        throw new UnauthorizedError("Invalid token");
    }

    if (decoded.iss != TOKEN_ISSUER) {
        throw new UnauthorizedError("Invalid issuer");
    }

    if (!decoded.sub) {
        throw new UnauthorizedError("No user ID in token");
    }

    return decoded.sub;
}
