import { ErrorModel } from "./ErrorModel";
export class ZodErrorModel extends ErrorModel {
    constructor(e, code = 400) {
        super();
        this.code = code;
        this.message = e.issues.map((e) => e.message);
    }
}
