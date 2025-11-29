import fetch from "node-fetch";

export async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        const apiKey = req.headers["x-api-key"];

        if (!authHeader || !apiKey)
            return res.status(401).json({ message: "Missing token or API key" });

        if (apiKey !== process.env.API_KEY)
            return res.status(403).json({ message: "Invalid API key" });

        const token = authHeader.split(" ")[1];

        // Validate Google token
        const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
        );

        if (!response.ok)
            return res.status(401).json({ message: "Invalid Google token" });

        const data = await response.json();

        if (data.aud !== process.env.GOOGLE_CLIENT_ID)
            return res.status(401).json({ message: "Invalid client ID" });

        req.user = { id: data.sub, email: data.email };

        next();

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Auth error" });
    }
}
