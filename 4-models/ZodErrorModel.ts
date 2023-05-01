interface ZodIssuesModel {
    issues: {message: string}[]
}

export class ZodErrorModel {
    message: string[]
    constructor(e: ZodIssuesModel) {
        this.message = e.issues.map(e => e.message)
    }
}