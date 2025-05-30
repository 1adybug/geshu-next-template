import Decimal from "decimal.js"

export function round(num: number, precision: number = 2) {
    return new Decimal(num).toDecimalPlaces(precision).toNumber()
}
