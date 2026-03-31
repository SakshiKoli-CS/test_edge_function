// Source hostname → redirect URL
const REDIRECT_MAP = {
  'brandall-estates.brandycare.com': 'https://www.brandycare.com/community/brandall-estates',
  'colts-neck.brandycare.com': 'https://www.brandycare.com/community/colts-neck',
  'fenwick-island.brandycare.com': 'https://www.brandycare.com/community/fenwick-island',
  'governors-crossing.brandycare.com': 'https://www.brandycare.com/community/governors-crossing',
  'haverford-estates.brandycare.com': 'https://www.brandycare.com/community/haverford-estates',
  'howell.brandycare.com': 'https://www.brandycare.com/community/howell',
  'huntington-terrace.brandycare.com': 'https://www.brandycare.com/community/huntington-terrace',
  'litchfield.brandycare.com': 'https://www.brandycare.com/community/litchfield',
  'livingston.brandycare.com': 'https://www.brandycare.com/community/livingston',
  'longwood.brandycare.com': 'https://www.brandycare.com/community/longwood',
  'mahwah.brandycare.com': 'https://www.brandycare.com/community/mahwah',
  'middlebrook-crossing.brandycare.com': 'https://www.brandycare.com/community/middlebrook-crossing',
  'moorestown-estates.brandycare.com': 'https://www.brandycare.com/community/moorestown-estates',
  'mountain-ridge.brandycare.com': 'https://www.brandycare.com/community/mountain-ridge',
  'pennington.brandycare.com': 'https://www.brandycare.com/community/pennington',
  'princeton.brandycare.com': 'https://www.brandycare.com/community/princeton',
  'reflections.brandycare.com': 'https://www.brandycare.com/community/reflections',
  'seaside-pointe.brandycare.com': 'https://www.brandycare.com/community/seaside-pointe',
  'serenade-at-princeton.brandycare.com': 'https://www.brandycare.com/community/serenade-at-princeton',
  'signature-haddonfield.brandycare.com': 'https://www.brandycare.com/community/signature-haddonfield',
  'summit.brandycare.com': 'https://www.brandycare.com/community/summit',
  'the-gables.brandycare.com': 'https://www.brandycare.com/community/the-gables',
  'the-savoy.brandycare.com': 'https://www.brandycare.com/community/the-savoy',
  'the-sycamore.brandycare.com': 'https://www.brandycare.com/community/the-sycamore',
  'toms-river.brandycare.com': 'https://www.brandycare.com/community/toms-river',
  'upper-providence.brandycare.com': 'https://www.brandycare.com/community/upper-providence',
  'voorhees.brandycare.com': 'https://www.brandycare.com/community/voorhees',
  'wall.brandycare.com': 'https://www.brandycare.com/community/wall',
};

export default function handler(request) {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();

  const redirectUrl = REDIRECT_MAP[hostname];
  if (redirectUrl) {
    return Response.redirect(redirectUrl, 302);
  }


  return fetch(request);
}
