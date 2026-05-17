// Дозволяємо TypeScript розуміти CSS-імпорти
declare module "*.css" {
  const styles: { [className: string]: string };
  export default styles;
}
