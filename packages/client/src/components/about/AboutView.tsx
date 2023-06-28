import Card from "antd/lib/card"
import { Content } from "antd/lib/layout/layout"
import React from "react"
import Footer from "../footer/Footer";
import CONTRIBUTORS from "./CONTRIBUTORS.json"
import REFERENCES from "./REFERENCES.json"




export default class AboutView extends React.Component<any, any>{
    render() {
        return (
            <>
                <div className="home-view-wrapper">
                    <Content style={{ padding: '50px', overflowY: "auto"}}>
                        <Card >
                            <h1>About</h1>
                            <h2>Acknowledgements</h2>
                            <p>This work was financially supported by the European Union’s Horizon 2020
                                research and innovation programme under the grant agreement No <a href={REFERENCES.GRANT_SITE}>101022622</a>
                                (European Climate and Energy Modelling Forum <a href={REFERENCES.ECEMF_SITE}>ECEMF</a>).
                            </p>
                            <h2>Team</h2>
                            <p>This webapp is developed by a team from <a href={REFERENCES.ARTELYS_SITE}>Artelys</a>,
                                nominally : <ul>{
                                    Object.entries(CONTRIBUTORS)
                                        .map( ([key, value]) => <li key={key}><a href={value}> {key} </a></li>)
                                }</ul>
                            </p>
                            <h2>Data Source</h2>
                            <p>
                                The data is pulled from the ECEMF public <a href={REFERENCES.DATA_SITE}>database</a>, hosted by ECEMF partner <a href={REFERENCES.IIASA_SITE}>IIASA</a>
                            </p>
                            <h2>Contribute & License</h2>
                            <p>
                                This webapp is licensed under the <a href={REFERENCES.LICENSE_SITE}>MIT License</a> and is hosted on <a href={REFERENCES.GITHUB}>Github</a>
                            </p>
                            <h2>Contact</h2>
                            <p>About bug reports, and related inquiries on the <a href={REFERENCES.DISCOURSE}>ECEMF forum</a></p>
                            <p>About the ECEMF project, by email : <a href={"mailto:" + REFERENCES.ECEMF_MAIL}>{REFERENCES.ECEMF_MAIL}</a></p>
                            <p>About the website development at Artelys, by email : <a href={"mailto:" + REFERENCES.ARTELYS_MAIL}>{REFERENCES.ARTELYS_MAIL}</a></p>
                        </Card>
                    </Content>
                </div>
                <Footer />
            </>
        )
    }
}
