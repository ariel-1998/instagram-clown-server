export function errorHandler(error, req, res, next) {
    //log to logger instead
    console.log(`Date: ${new Date().toISOString()} \n method: ${req.method} \n URL: 
    ${req.originalUrl} \n ip: ${req.ip}\n`);
    res.status(error.code).json({ message: error.message });
}
