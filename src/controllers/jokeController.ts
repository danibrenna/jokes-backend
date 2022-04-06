import {
  Controller,
  Route,
  SuccessResponse,
  Tags,
  Get,
  Query
} from "tsoa";
import { SearchJokeResponse } from "../models/joke";
import { GenericService } from "../services/genericService";
@Route("jokes")
@Tags("Jokes")

export class JokeController extends Controller {
  /**
   * Get jokes by query
   * @summary Get jokes by query
   * @param {string} query
   * @minLength query 3
   */
  @Get("search")
  @SuccessResponse("200", "Successful")
  public async findJokesByQuery(
    @Query() query: string
  ): Promise<SearchJokeResponse> {
    return new Promise(async function(resolve, reject) {
      let apiResp = await GenericService.callAPI("GET", `https://api.chucknorris.io/jokes/search`, {query}, null, {});
      console.log("apiResp", apiResp);
      return resolve({success:true, message: "OK", total: apiResp.total, result: apiResp.result})
    });
  }
}