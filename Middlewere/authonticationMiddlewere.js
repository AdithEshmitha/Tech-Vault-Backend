import jwt, { decode } from 'jsonwebtoken';

export default function middlewareAuth(req, res, next) {

    const value = req.header("Authorization");

    if (value != null) {
        const newToken = value.replace("Bearer ", "");

        jwt.verify(newToken, "sayu0317",
            (err, decoded) => {
                if (err || decoded == null) {
                    return res.status(401).json({ massage: "Unauthorized access detected" });
                } else {
                    req.user = decoded;
                    next()
                }
            }
        );
    } else {
        next();
    }

}
