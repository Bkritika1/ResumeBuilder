export default function Skills({ data }) {
    return (
        <div className="skills">
            <h2>Skills</h2>
            <ul>
                {data.skills.map((skill, index) => <li key={index}>{skill}</li>)}
            </ul>
        </div>
    );
}