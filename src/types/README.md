# types/

Tipos TypeScript **compartidos** por toda la app. Sobre todo, el espejo de los
`record` de C# que viajan como JSON por la API (Day, Media, Task, Metric...).
Mantener sincronizados manualmente con src-dotnet/Modules/*/<Entidad>.cs
(propiedades PascalCase en C# → camelCase en el JSON).
