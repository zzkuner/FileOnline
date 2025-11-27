import { Client } from 'minio'
const client = new Client({ endPoint: 'localhost', accessKey: 'foo', secretKey: 'bar' })
// Check prototype methods
let obj = client
const methods = new Set()
while (obj) {
    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (typeof client[prop] === 'function') {
            methods.add(prop)
        }
    })
    obj = Object.getPrototypeOf(obj)
}
console.log(Array.from(methods).sort())
