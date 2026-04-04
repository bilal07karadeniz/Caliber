export const sanitizeUser = (user: any) => {
  const { password, ...sanitized } = user;
  return sanitized;
};
