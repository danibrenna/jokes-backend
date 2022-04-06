import {
  Controller,
  Route,
  SuccessResponse,
  Tags,
  Get
} from "tsoa";
import { CustomResponse } from "../models/response";
@Route("hello")
@Tags("Hello")

export class HelloController extends Controller {
  /**
   * Get hello world message
   * @summary Get hello world message
   */
  @Get()
  @SuccessResponse("200", "Successful")
  public async helloWorld(): Promise<CustomResponse> {
    return new Promise(async function(resolve, reject) {
      return resolve({success:true, message: "Hello world"})
    });
  }
}