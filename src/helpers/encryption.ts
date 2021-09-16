import crypto from "crypto";
import Encode from "../models/encode";
import BigNumber from "bignumber.js";
import { HttpException } from "../interfaces/error";

const BigBase64 = {

    _Rixits :
//   0       8       16      24      32      40      48      56     63
//   v       v       v       v       v       v       v       v      v
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/",

    fromNumber : function(number: BigNumber) {
        if(number.isNaN() || !number.isInteger()) 
            throw "The input is not valid";
        if (number.isNegative())
            throw "Can't represent negative numbers now";

        var rixit; // like 'digit', only in some non-decimal radix 
        var residual = number.integerValue(BigNumber.ROUND_FLOOR);
        var result = '';
        while (true) {
            rixit = residual.mod(64)
            
            result = this._Rixits.charAt(rixit.toNumber()) + result;
            
            residual = residual.dividedBy(64).integerValue(BigNumber.ROUND_FLOOR);
            

            if (residual.isEqualTo(0))
                break;
            }
        return result;
    },

    toNumber : function(rixits: any) {
        var result = new BigNumber(0);
        
        rixits = rixits.split('');
        for (var e = 0; e < rixits.length; e++) {
            result = (result.multipliedBy(64)).plus(this._Rixits.indexOf(rixits[e]));
        }
        return result;
    }
}

function zerOne(): string {
    return crypto.randomInt(0, 2).toString();
}

function generateBinaryString(min: number, max: number): string { // $min inclusive, $max exclusive
    let binaryString: string = "";
    let randomLength: number = crypto.randomInt(min, max);

    for (let i = 0; i < randomLength; i++) {
        binaryString += zerOne();
    }

    return binaryString;
}

async function generateRandomEncode(char: string) {
    let code = generateBinaryString(+process.env.CODE_MIN!, +process.env.CODE_MAX!);
    let encode;

    while(true) {
        const encodes = await Encode.find({code}) as [];
        if(encodes.length > 0) {
            code = generateBinaryString(+process.env.CODE_MIN!, +process.env.CODE_MAX!);
        } else {
            encode = await new Encode({character: char, code}).save();
            break;
        }
    }
        
    return encode;
}

export async function checkData(data: any) {
    for(let key in data) {
        for(let x of data[key]) {
            let encodes = await Encode.find({character: x}) as [];
            if(encodes.length == 0) {
                await generateRandomEncode(x)
            }
        }
    }
}

export async function checkKey(key: string) {
    for(let x of key) {
        let encodes = await Encode.find({character: x}) as [];
        if(encodes.length == 0) {
            await generateRandomEncode(x)
        }
    }
}

export async function encrypt(message: string, key?: string): Promise<string> {
    let encryptedMessage: string = "";

    if(key) {
        encryptedMessage += process.env.KEY_ON!;
        encryptedMessage += key.length.toString(2).padStart(+process.env.KEY_PAD!, '0');

        for(let x of key) {
            let randomizer = generateBinaryString(+process.env.ENCRYPTION_MASK_MIN!, +process.env.ENCRYPTION_MASK_MAX!);
    
            const encode = await Encode.find({character: x});
            let encodedChar = encode[0].code; // Get DB
    
            encryptedMessage += randomizer.length.toString(2) + zerOne() + encodedChar.length.toString(2).padStart(+process.env.PAD!, '0') + zerOne() + randomizer + encodedChar + zerOne();
        }
    } else {
        encryptedMessage += process.env.KEY_OFF!;
    }
    
    for(let x of message) {
        let randomizer = generateBinaryString(+process.env.ENCRYPTION_MASK_MIN!, +process.env.ENCRYPTION_MASK_MAX!);

        const encode = await Encode.find({character: x});
        let encodedChar = encode[0].code; // Get DB

        encryptedMessage += randomizer.length.toString(2) + zerOne() + encodedChar.length.toString(2).padStart(+process.env.PAD!, '0') + zerOne() + randomizer + encodedChar + zerOne();
    }

    return BigBase64.fromNumber(new BigNumber(encryptedMessage, 2));
} 

export async function decrypt(encryptedMessage64: string, key?: string): Promise<string> {
    let encryptedMessage = BigBase64.toNumber(encryptedMessage64).toString(2);

    let encryptedChar = '';

    let decryptedMessage = "";

    const keyStatus = encryptedMessage.substring(0, +process.env.KEY_STS_LEN!);
    encryptedMessage = encryptedMessage.substring(+process.env.KEY_STS_LEN!);

    if(keyStatus === process.env.KEY_ON!) {
        const keyLen = parseInt(encryptedMessage.substring(0, +process.env.KEY_PAD!), 2);
        encryptedMessage = encryptedMessage.substring(+process.env.KEY_PAD!);

        let decryptedKey = '';

        for(let i = 0; i < keyLen; i++) {
            let randomizer = parseInt(encryptedMessage.substring(0, +process.env.RAND_END!), 2);
            let charLength = parseInt(encryptedMessage.substring(+process.env.LEN_START!, +process.env.LEN_END!), 2);
    
            let beginning: number = +process.env.ENCODE_START!;
            beginning += randomizer;
            let end = beginning + charLength;
            encryptedChar = encryptedMessage.substring(beginning, end);
    
            const encode = await Encode.find({code: encryptedChar});
            decryptedKey += encode[0].character; // Get from DB
    
            encryptedMessage = encryptedMessage.substring(beginning + charLength + 1);
        }

        if(key !== decryptedKey) throw new HttpException(401, "Wrong Passkey");
    }



    while(encryptedMessage.length > 0) {
        let randomizer = parseInt(encryptedMessage.substring(0, +process.env.RAND_END!), 2);
        let charLength = parseInt(encryptedMessage.substring(+process.env.LEN_START!, +process.env.LEN_END!), 2);

        let beginning: number = +process.env.ENCODE_START!;
        beginning += randomizer;
        let end = beginning + charLength;
        encryptedChar = encryptedMessage.substring(beginning, end);

        const encode = await Encode.find({code: encryptedChar});
        decryptedMessage += encode[0].character; // Get from DB

        encryptedMessage = encryptedMessage.substring(beginning + charLength + 1);
    }

    return decryptedMessage;
}