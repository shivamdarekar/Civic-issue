/**
 * BigInt and Decimal Serialization Utility
 * Converts BigInt and Decimal.js values to numbers for JSON serialization
 */

export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  // Handle Decimal.js objects - multiple detection methods
  if (obj && typeof obj === 'object') {
    // Method 1: Check constructor name
    if (obj.constructor && obj.constructor.name === 'Decimal') {
      return Number(obj.toString());
    }
    
    // Method 2: Check for Decimal.js structure (has s, e, d properties)
    if (typeof obj.s === 'number' && typeof obj.e === 'number' && Array.isArray(obj.d)) {
      // This is likely a Decimal.js object
      try {
        return Number(obj.toString());
      } catch {
        // Fallback: manually calculate from Decimal structure
        const sign = obj.s;
        const exponent = obj.e;
        const digits = obj.d;
        
        if (digits.length === 0) return 0;
        
        let result = 0;
        for (let i = 0; i < digits.length; i++) {
          result = result * 10000000 + digits[i]; // Decimal.js uses base 10000000
        }
        
        result = result * Math.pow(10, exponent - digits.length + 1);
        return sign * result;
      }
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }

  return obj;
}