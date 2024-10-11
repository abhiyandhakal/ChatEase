import http from "../utils/http";

export function getOwnUserDetail() {
  return http({
    url: "user/profile",
    method: "get",
  });
}

export function userSearchByString(query: string) {
  return http({
    url: `user/search/${query}`,
    method: "get",
  });
}
