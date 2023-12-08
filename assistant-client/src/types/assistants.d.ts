interface Assistant {
  id: string;
  object: string;
  created_at: number;
  name: string;
  description?: string;
  model: string;
  instructions: string;
  tools: any[];
  file_ids: any[];
  metadata: any;
}
