export class ErrorModel {
    code;
    message;
}
export class ErrorHandlerModel extends ErrorModel {
    constructor(e = "Server error") {
        super();
        this.code = 500;
        this.message = e;
    }
}
