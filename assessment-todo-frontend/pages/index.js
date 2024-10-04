import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import { useRouter } from 'next/router';
import apiFetch from '../functions/apiFetch';

const Index = () => {
    const router = useRouter();
    const handleLogout = async () => {
        try {
            const response = await apiFetch("/user/session", {
                method: "DELETE"
            });
            if (response.status === 200) {
                router.push("/");
            }
            else {
                alert("Failed to log out. Please try again.");
            }
        } catch (err) {
            alert("Failed to log out. Please try again.");
            console.error(err);
        }
    }

    return (
        <PageLayout title="Dashboard">
            <Button text="Logout" onClick={handleLogout} size="large" variant="primary" />
            <Container>
                <div className="content">
                    <img className="logo" src="/img/todox-logo-black.svg" />
                    <div className="buttons">
                        <Link className="noLinkStyling" href="/create">
                            <Button text="Create new todo" size="large" variant="primary" isFullWidth />
                        </Link>
                        <Link className="noLinkStyling" href="/todos">
                            <Button text="My todos" size="large" variant="primary" isFullWidth />
                        </Link>
                    </div>
                </div>
            </Container>
        </PageLayout>
    );
};

export default Index;

const Container = styled.div`
    width: 100%;

    .content {
        .logo {
            height: 8.125rem;
            width: 14.625rem;
        }

        .noLinkStyling {
            text-decoration: none;
        }

        .buttons {
            > * {
                display: block;
                margin-bottom: 0.75rem;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
`;