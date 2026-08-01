export const notFound = (req,res,next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

export const errorHandler = (err, req, res, next) => {
    console.error("Unhandled error:", err);

    if(err.name === "ValidationError")  {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({
            success: false,
            message: messages.join(", "),
        })
    }

    if(err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    if (err.name === "CastError") {
        return res.status(404).json({
            success: false,
            message: "Resource not found",
        });
    }

    if (err.name === "MulterError") {
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
    }

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Something went wrong on the server",
    });
}