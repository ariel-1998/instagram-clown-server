export class ErrorModel {
  code: number;
  message: string | string[];
}

export class ErrorHandlerModel extends ErrorModel {
  constructor(e = "Server error") {
    super();
    this.code = 500;
    this.message = e;
  }
}
