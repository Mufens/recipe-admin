/** GET /api/detail?id= 返回的 result */
export interface RecipeStep {
  text: string
  image?: string
}

export interface RecipeIngredient {
  name: string
  value: string
}

export interface RecipeTag {
  id: number
  name: string
  /** 从一级到叶子的分类路径 */
  path_label?: string
}

export interface RecipeDetail {
  id: number
  img: string
  title: string
  use_time: string | null
  difficulty: string | null
  /** 做过人数 */
  person: number | null
  /** 点赞数 */
  up: number | null
  pictures: string[] | null
  author_id: number | null
  author_name: string | null
  author_avatar: string | null
  description: string | null
  ingredients: RecipeIngredient[] | null
  steps: RecipeStep[] | null
  star: number
  /** 步骤图比例 */
  ratio: string | null
  tips: string | null
  /** 列表浏览桶；编辑回退用 */
  category_id: string | null
  tags: RecipeTag[]
}
