import BrotliDecompressStream, { Result } from "tiny-brotli-dec-wasm";

BrotliDecompressStream.init();

class BrotliDecTransformStream extends TransformStream {
    #stream = null;

    constructor() {
        super({
            start: async (controller) => {
                // Queue a microtask to wait until `this` has
                // been constructed.
                await null;
                this.#start(controller);
            },
            flush: (controller) => this.#flush(controller),
            cancel: (reason) => this.#cancel(reason),
            transform: (chunk, controller) => this.#transform(chunk, controller),
        });
    }

    async #start(controller) {
        this.#stream = await BrotliDecompressStream.create();
    }
    async #flush(controller) {
        this.#free();
    }
    async #cancel(reason) {
        this.#free();
    }
    async #transform(chunk, controller) {
        let start = 0;

        while (true) {
            const input = chunk.subarray(start);
            const output = this.#stream.dec(input, 1024 * 1024)

            controller.enqueue(output);
            
            start += this.#stream.lastInputOffset();
            const result = this.#stream.result();

            if (result === Result.NeedsMoreOutput) {
                continue;
            } else if (result === Result.NeedsMoreInput) {
                break;
            } else if (result === Result.Success) {
                controller.terminate();
                this.#free();
                break;
            } else {
                controller.error("Brotli decompression failed");
                this.#free();
                break;
            }
        }
    }

    #free() {
        this.#stream?.free?.();
        this.#stream = null;
    }
}

export default BrotliDecTransformStream;
