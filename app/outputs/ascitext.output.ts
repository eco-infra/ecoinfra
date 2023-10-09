import Output from "./output";

const figlet = require("figlet");

export default class ASCITextOutput extends Output{
    public async getASCIText() {
        return await figlet.textSync(`Emission ${this.cli.getBreakdown() ? 'Breakdown' : 'Summary'}`, {
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 80,
            whitespaceBreak: true,
        })
    }

}