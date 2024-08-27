class ResponseError extends Error {
    constructor(name: string, message: string) {
        super(message);
        this.name = statuscode
    }

    sayHello() {
        return "hello " + this.message;
    }
}