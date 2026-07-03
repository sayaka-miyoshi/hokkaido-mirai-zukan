/** 関連記事グラフ（ビルド時生成・ランタイム計算のキャッシュ） */

export type RelatedGraphSection = {
  title: string
  postIds: string[]
}

export type RelatedGraphNode = {
  postId: string
  sections: RelatedGraphSection[]
  updatedAt: string
}

export type EntityGraph = {
  version: 1
  generatedAt: string
  postCount: number
  nodes: Record<string, RelatedGraphNode>
}

export const ENTITY_GRAPH_PATH = '/data/entity-graph.json'
