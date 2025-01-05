class ResponseHelper {
    static success(res, status, data, message = 'Başarılı') {
        return res.status(status).json({
            status: 'success',
            message,
            data,
        });
    }

    static error(res, status, message = 'Hata') {
        return res.status(status).json({
            status: 'error',
            message,
        });
    }
}

module.exports = ResponseHelper;
