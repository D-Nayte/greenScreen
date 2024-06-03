import { EventEmitter } from 'events'

class MockChildProcess extends EventEmitter {
    stdout: EventEmitter
    stderr: EventEmitter
    stdin: EventEmitter

    constructor() {
        super()
        this.stdout = new EventEmitter()
        this.stderr = new EventEmitter()
        this.stdin = new EventEmitter()
    }
}

export default MockChildProcess
