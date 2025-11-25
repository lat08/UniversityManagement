export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
  
  return str;
}

export function compareVietnameseString(str1: string, str2: string): boolean {
  return removeVietnameseTones(str1.toLowerCase()) === removeVietnameseTones(str2.toLowerCase());
}

export function includesVietnamese(str: string, keyword: string): boolean {
  const normalizedStr = removeVietnameseTones(str.toLowerCase());
  const normalizedKeyword = removeVietnameseTones(keyword.toLowerCase());
  return normalizedStr.includes(normalizedKeyword);
}
