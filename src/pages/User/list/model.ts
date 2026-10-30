export interface UserItem {
  id: number
  phone: string
  username: string | null
  avatar: string | null
  create_time: string
  province: string | null
  birthday: string | null
  profession: string | null
  /** 家乡 */
  home: string | null
  /** 简介 */
  des: string | null
  /** 关注数 */
  attention: number
  /** 粉丝数 */
  fan: number
}

export interface UserListResult {
  items: UserItem[]
  total: number
  page: number
  pageSize: number
  pages: number
}
