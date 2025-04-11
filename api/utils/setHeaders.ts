import { VercelResponse } from "@vercel/node";

type Header= {
    name: string;
    key: string;
}
export function setHeaders(res: VercelResponse, headers: Header[]) {
    headers.forEach((header) => {
        res.setHeader(header.name, header.key);
    });
}