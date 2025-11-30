import { apiClient } from '../lib/api-client';
import { ENDPOINTS } from '../config/api';
import type {
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
} from '../types';

export const tagService = {
  async getAll(): Promise<Tag[]> {
    return apiClient.get<Tag[]>(ENDPOINTS.TAGS);
  },

  async getById(id: number): Promise<Tag> {
    return apiClient.get<Tag>(`${ENDPOINTS.TAGS}/${id}`);
  },

  async create(data: CreateTagRequest): Promise<Tag> {
    return apiClient.post<Tag>(ENDPOINTS.TAGS, data);
  },

  async update(id: number, data: UpdateTagRequest): Promise<Tag> {
    return apiClient.put<Tag>(`${ENDPOINTS.TAGS}/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.TAGS}/${id}`);
  },
};
