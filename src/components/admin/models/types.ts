export interface Category {
  id: number;
  name: string;
}

export interface ModelFormData {
  // Basic info
  name: string;
  brand: string;
  manufacturer: string;
  family: string;
  category_id: string;
  aliases: string;
  
  // Specs
  chip: string;
  vram_gb: string;
  memory_type: string;
  bus_width_bit: string;
  tdp_w: string;
  outputs_count: string;
  release_date: string;
  
  // Additional specs (JSON)
  base_clock_mhz: string;
  boost_clock_mhz: string;
  memory_bandwidth_gbps: string;
  cuda_cores: string;
  stream_processors: string;
  ray_tracing: boolean;
  dlss_fsr: string;
  pcie_version: string;
  power_connector: string;
  recommended_psu_w: string;
  length_mm: string;
  slots: string;
}

export const initialFormData: ModelFormData = {
  name: '',
  brand: '',
  manufacturer: '',
  family: '',
  category_id: '',
  aliases: '',
  chip: '',
  vram_gb: '',
  memory_type: '',
  bus_width_bit: '',
  tdp_w: '',
  outputs_count: '',
  release_date: '',
  base_clock_mhz: '',
  boost_clock_mhz: '',
  memory_bandwidth_gbps: '',
  cuda_cores: '',
  stream_processors: '',
  ray_tracing: false,
  dlss_fsr: '',
  pcie_version: '',
  power_connector: '',
  recommended_psu_w: '',
  length_mm: '',
  slots: '',
};
