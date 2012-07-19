from Products.Five.browser import BrowserView
from zope.component import getMultiAdapter
from plone.uuid.interfaces import IUUID

class FlowSearchSearch(BrowserView):

    def __call__(self):
        return super(FlowSearchSearch, self).__call__()

    def removeContextFromResults(self, results):
        context_uid = IUUID(self.context, None)
        results = [res for res in results if res.UID != context_uid]
        return results
