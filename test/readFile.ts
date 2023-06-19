import { readFileSync } from "fs"
export function readFileLines(filePath: string): string[] {
    const fileContent = readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    return lines;
}
