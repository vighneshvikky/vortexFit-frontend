 export function onImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'assets/images/default-user.png'; 
}