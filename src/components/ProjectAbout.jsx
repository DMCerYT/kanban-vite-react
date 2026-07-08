export function ProjectAbout({ value, onChange }) {
  return (
    <section className="about-panel">
      <div>
        <span>About This Project</span>
        <h3>Notas del proyecto</h3>
      </div>
      <textarea
        className="textarea about-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Objetivo, contexto, decisiones importantes o criterios para considerar este proyecto terminado."
      />
    </section>
  );
}
