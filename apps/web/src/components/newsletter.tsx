import { useEffect } from 'react';
import { BellRing, Check } from 'lucide-react';

/** Hostinger Reach signup form ("Website newsletter"). Sign-ups go straight into the Reach audience. */
const REACH_FORM_ID = 'f582869f-b6df-4a6e-abd1-a91d7e68467e';
const REACH_SCRIPT = 'https://cdn-reach.hostinger.com/js/embed.js';

export function Newsletter(){
	// Reach's script fills every [data-reach-form] placeholder when it runs, so it is re-run each time this
	// section mounts (moving between Home and Learn mounts a fresh placeholder).
	useEffect(() => {
		const script = document.createElement('script');
		script.src = REACH_SCRIPT;
		script.async = true;
		document.body.appendChild(script);
		return () => script.remove();
	}, []);
	return <section className="newsletter">
		<div className="newsletter-copy">
			<p className="eyebrow">STAY IN THE KNOW</p>
			<h2>Good deals start with<br/>better information.</h2>
			<p>Real estate funding insights and Claw Point updates, straight to your inbox.</p>
			<ul className="newsletter-perks">
				<li><Check size={16}/>Funding tips for EMD, double close, Echo and Stack deals</li>
				<li><Check size={16}/>New guides and calculators first</li>
				<li><Check size={16}/>No spam. Unsubscribe anytime</li>
			</ul>
		</div>
		<div className="newsletter-card">
			<p className="newsletter-card-title"><BellRing size={18}/>Join the Claw Point list</p>
			<div className="reach-form" data-reach-form={REACH_FORM_ID}/>
		</div>
	</section>;
}
