import { ErrorModel } from "./ErrorModel";

interface ZodIssuesModel {
  issues: { message: string }[];
}

export class ZodErrorModel extends ErrorModel {
  constructor(e: ZodIssuesModel, code = 400) {
    super();
    this.code = code;
    this.message = e.issues.map((e) => e.message);
  }
}
