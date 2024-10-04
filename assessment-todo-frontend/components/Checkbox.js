import styled from "styled-components";

const Checkbox = ({className, checked, onChange}) => {
    return (
        <Container className={className} checked={checked} onChange={onChange}>
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="checkmark"></span>
        </Container>
    );
};

export default Checkbox;

const Container = styled.div``