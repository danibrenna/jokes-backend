import { CustomResponse } from "./response"

export type Joke = {
  categories: string[],
  created_at: string,
  icon_url: string,
  value: string,
  updated_at: string,
  id: string,
  url: string
}

export interface SearchJokeResponse extends CustomResponse {
  total: number,
  result: Joke[]
}