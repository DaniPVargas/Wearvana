import React from "react";
import { Container, Navbar, Button } from "react-bootstrap";

export const Root = () => {
  return (
    <Container fluid className="vh-100">
      <Container className="main-container vh-100 px-0">
        <Navbar fixed="bottom" bg="light" className="border-top shadow-lg">
          <Container className="d-flex justify-content-around">
            <Button variant="primary">Inicio</Button>
            <Button variant="secondary">Buscar</Button>
            <Button variant="success">Perfil</Button>
          </Container>
        </Navbar>
      </Container>
    </Container>
  );
};
