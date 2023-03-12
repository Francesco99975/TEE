const shuffle = (str: string) => [...str].sort(() => Math.random() - 0.5).join('');

export { shuffle };