import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class SendEmailDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}