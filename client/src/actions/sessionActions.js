export function loadData(createdAt, password, url) {
  return {
    type: 'NEW_SESSION',
    createdAt: createdAt,
    password: password,
    url: url,
  }
}
